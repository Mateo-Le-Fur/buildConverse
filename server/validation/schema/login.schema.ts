import Joi from "joi";

export = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Le format de l'email n'est pas valide",
  }),

  password: Joi.string().required().max(100).messages({
    "string.max": "100 caractères maximum",
    "string.pattern.base":
      "Le mot de passe doit contenir minimum 8 caractères , 1 caractère spécial et 1 chiffre !",
  }),
});
