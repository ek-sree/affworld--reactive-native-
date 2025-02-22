export interface ExecutionData {
    timestamp: string;
    response: {
      order?: number; 
      error?: string; 
    };
    error?: string; 
  }
  
  export interface ExecutionDetails{
      remains:string;
      status:string;
  }
  
  export interface ExecutionModalProps {
    visible: boolean;
    onClose: () => void;
    executionData: ExecutionData[];
  }