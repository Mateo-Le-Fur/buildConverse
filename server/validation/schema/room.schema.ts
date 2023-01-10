import Joi from "joi";

export = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().min(2).max(30).required(),
  roomId: Joi.number().optional(),
  namespaceId: Joi.number().optional(),
  index: Joi.number().optional().allow(null).messages({
    "string.min": "2 caractères minimum",
    "string.max": "30 caractères maximum",
  }),
});
