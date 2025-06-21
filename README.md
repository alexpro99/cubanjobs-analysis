# Análisis de Canales de Telegram para la Extracción de Ofertas de Empleo

Este proyecto desarrolla un modelo de concepto para la extracción automatizada de datos no estructurados de los canales de Telegram y su transformación en una base de datos estructurada dentro de PostgreSQL. Aprovechando LLMs, el sistema realiza un entendimiento del lenguaje natural para identificar y categorizar ofertas de empleo, convirtiéndolas en un formato estándar adecuado para el almacenamiento y el análisis.

## Conexión a Telegram como Usuario

Para conectarse a Telegram como usuario, se utiliza la librería GramJS. Siga estos pasos:

1.  **Obtenga su `api_id` y `api_hash`:**
    *   Diríjase a [my.telegram.org](https://my.telegram.org/) (se recomienda abrir en modo incógnito para evitar problemas con extensiones).
    *   Inicie sesión con su cuenta de Telegram.
    *   Vaya a "API development tools" y complete los campos requeridos para crear una nueva aplicación.
    *   Anote el `api_id` y el `api_hash` proporcionados.

2.  **Ejecute el script `logginTelegram.js`:**
    *   Este script le permitirá iniciar sesión con su cuenta de Telegram o con la cuenta que desee utilizar para la monitorización.
    *   Siga las instrucciones del script para completar el proceso de autenticación.

Consulte la [documentación de GramJS](https://gram.js.org/) para obtener más detalles sobre la configuración y el uso de la librería.

## Integración con Modelos de Lenguaje (LLM)

La API está diseñada para integrarse con diversos modelos de lenguaje, incluyendo:

*   **OpenAI**
*   **Google AI**
*   **Ollama**

Personalmente, se ha obtenido un buen rendimiento con el modelo `gemma3:4b` de Ollama.

## Project Setup

### Requisitos Previos

* [Node.js](https://nodejs.org/) (v18 o superior)
* [NestJS](https://nestjs.com/) (framework utilizado para la estructura del proyecto)
* [Docker](https://www.docker.com/) (para la base de datos PostgreSQL)
* [Ollama](https://ollama.com/) (opcional, para el modelo `gemma3:4b` u otros modelos locales)

### Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone <repository_url>
    cd cubanjobs-analysis
    ```

2.  **Instalar las dependencias:**

    ```bash
    pnpm install
    ```

3.  **Configurar las variables de entorno:**

    *   Copiar el archivo `.env.example` a `.env` y modificarlo con sus credenciales.

        ```bash
        cp .env.example .env
        nano .env
        ```

    *   Asegúrese de configurar las siguientes variables:
        *   `API_ID` y `API_HASH` de Telegram.
        *   Claves API para los LLMs que desee utilizar (OpenAI, Google AI, Groq, etc.).
        *   Credenciales de la base de datos PostgreSQL.

4.  **Iniciar la base de datos PostgreSQL con Docker:**

    ```bash
    docker-compose up -d
    ```

5. **Correr seeds**
    ```bash
    pnpm seed
    ```


### Como contribuir? 

Si desea contribuir a este proyecto, siga estas pautas:

*   Reporte cualquier problema o error a través de la sección "Issues" en GitHub.
*   Envíe solicitudes de extracción (pull requests) con mejoras, correcciones o nuevas funcionalidades.
*   Asegúrese de que el código siga las convenciones de estilo del proyecto.
*   Documente cualquier cambio importante en el código.

### Lisencia

Este proyecto se lanza bajo la licencia MIT.

### Contacto

Si tiene alguna pregunta o necesita ayuda, puede ponerse en contacto a través de la sección "Issues" en GitHub.

### Disclaimer

La información extraída de los canales de Telegram puede no ser precisa o estar actualizada. Este proyecto no se hace responsable de la exactitud o fiabilidad de las ofertas de empleo mostradas.
