import { z } from "zod";
import { NotFoundError } from "../lib/errors.js";
import { validate } from "../lib/validation.js";
import { userRepository } from "../repositories/index.js";

const slackSettingsSchema = z.object({
  webhookUrl: z.string().url("Invalid webhook URL").optional(),
});

export const settingsService = {
  async getSlackSettings(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      webhookUrl: user.slackWebhookUrl,
    };
  },

  async updateSlackSettings(userId, payload) {
    const { webhookUrl } = validate(slackSettingsSchema, payload);

    const user = await userRepository.update(userId, {
      slackWebhookUrl: webhookUrl || null,
    });

    return {
      webhookUrl: user.slackWebhookUrl,
    };
  },
};
