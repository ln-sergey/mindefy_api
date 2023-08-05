export interface AIService {
  _id: string;
  name: string;
  link: string;
  /** @example image.analog.photo | text.code */
  media_groupe: string;
  /** @example editing.enhancement | generation */
  operation_groupe: string;
  description: string;
  /** Important points about Service */
  key_points: string[];
  /** Rate points for ranging services */
  rate: number;
  /** @example free | 30 days trial | 10 free attempts */
  minimum_payment_plan: string;
  language_codes: string[];
  updated: number;
}
