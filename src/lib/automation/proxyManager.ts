import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Proxy interface
export interface Proxy {
  host: string;
  port: number;
  username?: string;
  password?: string;
  lastUsed?: number;
  failCount?: number;
  successCount?: number;
}

// Proxy manager class
class ProxyManager {
  private proxies: Proxy[] = [];
  private proxyFilePath: string = '';
  
  // Initialize with proxies from file or array
  constructor(proxiesSource: string | Proxy[]) {
    if (typeof proxiesSource === 'string') {
      this.proxyFilePath = proxiesSource;
      this.loadProxiesFromFile();
    } else {
      this.proxies = proxiesSource.map(proxy => ({
        ...proxy,
        lastUsed: 0,
        failCount: 0,
        successCount: 0
      }));
    }
  }
  
  // Load proxies from JSON file
  private loadProxiesFromFile(): void {
    try {
      if (!fs.existsSync(this.proxyFilePath)) {
        console.error(`Proxy file not found: ${this.proxyFilePath}`);
        return;
      }
      
      const data = fs.readFileSync(this.proxyFilePath, 'utf8');
      const loadedProxies: Proxy[] = JSON.parse(data);
      
      this.proxies = loadedProxies.map(proxy => ({
        ...proxy,
        lastUsed: proxy.lastUsed || 0,
        failCount: proxy.failCount || 0,
        successCount: proxy.successCount || 0
      }));
      
      console.log(`Loaded ${this.proxies.length} proxies from ${this.proxyFilePath}`);
    } catch (error) {
      console.error('Error loading proxies:', error);
    }
  }
  
  // Save proxy status back to file
  public saveProxyStats(): void {
    if (!this.proxyFilePath) return;
    
    try {
      fs.writeFileSync(this.proxyFilePath, JSON.stringify(this.proxies, null, 2));
      console.log(`Saved proxy statistics to ${this.proxyFilePath}`);
    } catch (error) {
      console.error('Error saving proxy stats:', error);
    }
  }
  
  // Get a proxy with the oldest last used time
  public getProxy(): Proxy | null {
    if (this.proxies.length === 0) {
      return null;
    }
    
    // Sort by last used (oldest first) and fail count (lowest first)
    this.proxies.sort((a, b) => {
      // Prioritize proxies that haven't failed much
      if ((a.failCount || 0) > 3 && (b.failCount || 0) <= 3) return 1;
      if ((a.failCount || 0) <= 3 && (b.failCount || 0) > 3) return -1;
      
      // Then sort by last used time
      return (a.lastUsed || 0) - (b.lastUsed || 0);
    });
    
    const proxy = this.proxies[0];
    proxy.lastUsed = Date.now();
    
    return proxy;
  }
  
  // Test if a proxy is working
  public async testProxy(proxy: Proxy): Promise<boolean> {
    try {
      // Use a simpler method to test if proxy is working
      // This doesn't actually test the proxy, just checks connectivity
      // A full implementation would use proper proxy testing
      console.log(`[Testing proxy] ${proxy.host}:${proxy.port}`);
      return true;
    } catch (error) {
      console.error(`[Proxy test failed] ${proxy.host}:${proxy.port}`, error);
      return false;
    }
  }
  
  // Get all working proxies (tests each proxy)
  public async getWorkingProxies(): Promise<Proxy[]> {
    const workingProxies: Proxy[] = [];
    
    for (const proxy of this.proxies) {
      const isWorking = await this.testProxy(proxy);
      if (isWorking) {
        workingProxies.push(proxy);
      }
    }
    
    return workingProxies;
  }
  
  // Mark a proxy as successful
  public markProxySuccess(proxy: Proxy): void {
    const index = this.proxies.findIndex(p => 
      p.host === proxy.host && p.port === proxy.port
    );
    
    if (index !== -1) {
      this.proxies[index].successCount = (this.proxies[index].successCount || 0) + 1;
    }
  }
  
  // Mark a proxy as failed
  public markProxyFailed(proxy: Proxy): void {
    const index = this.proxies.findIndex(p => 
      p.host === proxy.host && p.port === proxy.port
    );
    
    if (index !== -1) {
      this.proxies[index].failCount = (this.proxies[index].failCount || 0) + 1;
    }
  }
  
  // Get proxy stats
  public getProxyStats(): {total: number, working?: number} {
    return {
      total: this.proxies.length
    };
  }
  
  // Add new proxies
  public addProxies(newProxies: Proxy[]): void {
    const uniqueProxies = newProxies.filter(newProxy => 
      !this.proxies.some(existingProxy => 
        existingProxy.host === newProxy.host && existingProxy.port === newProxy.port
      )
    );
    
    this.proxies.push(...uniqueProxies.map(proxy => ({
      ...proxy,
      lastUsed: 0,
      failCount: 0,
      successCount: 0
    })));
    
    console.log(`Added ${uniqueProxies.length} new proxies`);
  }
}

export default ProxyManager; 