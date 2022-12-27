import Joi from "joi";

export = Joi.object({
  pseudo: Joi.string().min(4).max(30).required().messages({
    "string.base": "La valeur doit être de type text",
    "string.min": "3 caractères minimum",
    "string.max": "30 caractères maximum",
    "any.required": "champ requis",
    "string.empty": "champ requis",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Le format de l'email n'est pas valide",
  }),

  password: Joi.string()
    .max(100)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .required()
    .messages({
      "string.max": "100 caractères maximum",
      "string.pattern.base":
        "Le mot de passe doit contenir minimum 8 caractères , 1 caractère spécial et 1 chiffre !",
    }),
});
