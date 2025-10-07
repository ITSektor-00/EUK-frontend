import developmentTemplateService from './developmentTemplateService';
import optimizedTemplateService from './optimizedTemplateService';

/**
 * Service factory za automatski izbor template service-a
 * Development mode: koristi development service (bez autentifikacije)
 * Production mode: koristi optimized service (sa autentifikacijom)
 */
class TemplateServiceFactory {
  private static instance: TemplateServiceFactory;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  static getInstance(): TemplateServiceFactory {
    if (!TemplateServiceFactory.instance) {
      TemplateServiceFactory.instance = new TemplateServiceFactory();
    }
    return TemplateServiceFactory.instance;
  }

  /**
   * Vrati odgovarajući service na osnovu environment-a
   */
  getService() {
    if (this.isDevelopment) {
      console.log('[FACTORY] Using development template service (no authentication)');
      return developmentTemplateService;
    } else {
      console.log('[FACTORY] Using optimized template service (with authentication)');
      return optimizedTemplateService;
    }
  }

  /**
   * Vrati informacije o trenutnom service-u
   */
  getServiceInfo() {
    return {
      isDevelopment: this.isDevelopment,
      serviceType: this.isDevelopment ? 'development' : 'optimized',
      nodeEnv: process.env.NODE_ENV
    };
  }

  /**
   * Force koristi development service (za testing)
   */
  forceDevelopmentService() {
    console.log('[FACTORY] Forcing development service');
    return developmentTemplateService;
  }

  /**
   * Force koristi optimized service (za testing)
   */
  forceOptimizedService() {
    console.log('[FACTORY] Forcing optimized service');
    return optimizedTemplateService;
  }
}

export default TemplateServiceFactory.getInstance();
