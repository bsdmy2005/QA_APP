declare module 'actions' {
  export interface ActionResult<T = any> {
    isSuccess: boolean;
    message: string;
    data?: T;
    error?: any;
  }

  // Add any other action-related types here
  export interface ActionContext {
    userId?: string;
    params?: Record<string, any>;
  }
} 