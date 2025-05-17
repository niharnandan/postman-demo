export interface ApiRoute {
    path: string;
    methods: string[];
  }
  
  export interface ApiResponse {
    [key: string]: any;
  }