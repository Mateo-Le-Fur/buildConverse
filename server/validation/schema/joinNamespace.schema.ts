import Joi from "joi";

export = Joi.object({
  inviteCode: Joi.string().length(8).required().messages({
    "string.length": "Le code d'invitation contient 8 caractères",
  }),
});
