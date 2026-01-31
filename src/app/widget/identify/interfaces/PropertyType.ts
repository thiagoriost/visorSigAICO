/**
 * Tipo de dato que se puede recibir en el feature
 * @date 2025-12-04
 * @author Andres Fabian Simbaqueba
 */
export type PropertyValue = string | number | JSONArray | JSONObject;

/**
 * Tipo de dato que puede ser un JSONObject
 * @date 2025-12-04
 * @author Andres Fabian Simbaqueba
 */
export type JSONObject = Record<string, string | number | JSONArray>;

/**
 * Tipo de dato que puede ser un JSONArray
 * @date 2025-12-04
 * @author Andres Fabian Simbaqueba
 */
export type JSONArray = PropertyValue[];
