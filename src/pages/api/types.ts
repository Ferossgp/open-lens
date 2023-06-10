export interface IMessage {
  role: string;
  content: string;
}

export type ISemanticType = 'quantitative' | 'nominal' | 'ordinal' | 'temporal';

export interface IField {
  fid: string;
  name: string;
  semanticType: ISemanticType;
}

export interface RequestBody {
  messages: IMessage[];
  metas: IField[];
}
export interface IResponseData {
  id: string;
  object: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: { message: { role: string; content: string } }[];
}

export interface UserResponse {
  handle: string;
  description?: string;
}