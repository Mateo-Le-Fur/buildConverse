import Joi from "joi";

export = Joi.object({
  namespaceId: Joi.number().optional(),

  name: Joi.string().min(2).max(30).required().messages({
    "string.min": "2 caractères minimum",
    "string.max": "30 caractères maximum",
  }),
  inviteCode: Joi.string().length(8).required().messages({
    "string.length": "Le code d'invitation contient 8 caractères",
  }),
  imgBuffer: Joi.optional(),
});
