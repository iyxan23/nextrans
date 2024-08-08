import { z } from "zod";

export const CardType = z.object({
  type: z.literal("card"),
  masked_card: z.string(),
  eci: z.string(),
  channel_response_message: z.string(),
  channel_response_code: z.string(),
  card_type: z.string(),
  bank: z.string(),
  approval_code: z.string(),
});

