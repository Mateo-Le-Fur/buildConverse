const Joi = require("joi");
export = Joi.object({
  pseudo: Joi.string()
    .optional()
    .max(50)
    .pattern(/^[a-zA-Z\u00C0-\u00FF\s]*$/)
    .messages({
      "string.max": "Le prénom ne peut dépasser 50 caractères",
      "string.pattern.base": "prenom: format invalide",
    }),

  email: Joi.string().optional().email().messages({
    "string.max": "Le nom ne peut dépasser 50 caractères",
    "string.email": "Le format de l'email n'est pas valide",
  }),

  description: Joi.string().optional().allow(null, "").max(260).messages({
    "string.max": "La description ne doit pas faire plus de 260 caractères",
  }),

  namespaces: Joi.array().optional(),

  friends: Joi.array().optional(),

  imgBuffer: Joi.optional(),
});
