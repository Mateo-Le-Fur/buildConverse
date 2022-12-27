import Joi from "joi";

export = Joi.object({
  id: Joi.number().optional(),
  roomId: Joi.number().optional(),
  namespaceId: Joi.number().optional(),
  index: Joi.number().optional(),
  name: Joi.string().min(2).max(30).required().messages({
    "string.min": "2 caractères minimum",
    "string.max": "30 caractères maximum",
  }),
});
