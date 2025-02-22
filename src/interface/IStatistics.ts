export interface StatisticsItem {
    _id: string;
    name: string;
    serviceId: string;
    quantity: number;
    timing: string;
    affiliate_id: string;
    link: string;
    maxExecutions: number;
    executionCount: number;
    status: string;
    totalCharges: number;
    totalQuantity: number;
    [key: string]: any;
  }
  
  export interface ExecutionData {
    timestamp: string;
    response: {
      order: number;
    };
  }
  
  export interface ModalPosition {
    x: number;
    y: number;
  }
  