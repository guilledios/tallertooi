# Quiz Taller

Aplicación web docente mínima para preguntas choice en vivo en talleres universitarios.

Stack:

- React + Vite + TypeScript
- Firebase Authentication anónima
- Firebase Firestore
- GitHub Pages
- Sin backend propio, sin servidor propio y sin Cloud Functions

## Funcionalidad incluida

Fase 1 implementada:

- carga de archivo `.txt` en formato Aiken;
- parseo automático de preguntas;
- creación de sesión con código corto;
- QR y enlace de ingreso para estudiantes;
- ingreso con alias;
- pregunta actual en tiempo real;
- respuesta única por estudiante y pregunta;
- gráfico de barras en vivo;
- mostrar u ocultar resultados;
- revelar respuesta correcta;
- avanzar manualmente;
- reiniciar votación de la pregunta actual;
- cerrar sesión.

## Formato Aiken

```txt
¿Qué es el marketing según Kotler y Armstrong?
A. Un conjunto de técnicas de venta agresiva
B. El proceso de crear valor para los clientes y obtener valor de ellos
C. Una herramienta exclusiva de publicidad
D. La distribución física de productos
ANSWER: B
```

Separá preguntas con una línea en blanco.

## Estructura

```txt
src/
  components/
  pages/
  hooks/
  firebase/
  parser/
  utils/
  types/
```

Archivos importantes:

- `src/parser/aikenParser.ts`: parser independiente de Aiken.
- `src/firebase/config.ts`: inicialización Firebase.
- `firestore.rules`: reglas de seguridad.
- `.env.example`: variables requeridas.
- `.github/workflows/deploy.yml`: despliegue a GitHub Pages.

## Crear proyecto Firebase

1. Entrá a [Firebase Console](https://console.firebase.google.com/).
2. Creá un proyecto nuevo.
3. Usá el plan Spark.
4. En Authentication, habilitá **Anonymous**.
5. En Authentication > Settings > Authorized domains, agregá el dominio de GitHub Pages cuando lo tengas, por ejemplo `usuario.github.io`.
6. En Firestore Database, creá una base en modo producción.
7. En Project settings, agregá una app web.
8. Copiá los valores de configuración web.
9. Creá `.env` desde `.env.example`:

```bash
cp .env.example .env
```

Completá:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Reglas Firestore

Las reglas están en `firestore.rules`.

Para publicarlas con Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use your-firebase-project-id
firebase deploy --only firestore:rules
```

También podés copiarlas manualmente en Firestore > Rules.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí la URL que muestra Vite.

## Despliegue en GitHub Pages

1. Subí el proyecto a un repositorio de GitHub.
2. En el repo, entrá a Settings > Pages.
3. En Source, elegí **GitHub Actions**.
4. En Settings > Secrets and variables > Actions, agregá estos secrets:

```txt
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

5. Hacé push a `main`.

La app usa rutas por hash y assets relativos, así que funciona bien bajo `https://usuario.github.io/nombre-del-repo/`.

## Modelo Firestore

```txt
sessions/{sessionId}
  ownerId
  createdAt
  currentQuestionIndex
  currentQuestionKey
  showResults
  showCorrectAnswer
  status
  questions

sessions/{sessionId}/participants/{participantId}
  name
  joinedAt
  lastSeen

sessions/{sessionId}/answers/{questionIndex_participantId}
  participantId
  questionIndex
  questionKey
  selectedOption
  submittedAt
  isCorrect
```

## Nota de seguridad

Esta app evita que un estudiante cambie la sesión, modifique respuestas de otros o responda más de una vez mientras exista su respuesta. Como no hay backend ni Cloud Functions, toda app cliente tiene límites: un usuario técnico podría inspeccionar datos disponibles para el cliente. Para talleres universitarios y votación formativa esto suele ser aceptable; no la uses como sistema de examen de alto impacto.

## Próximas fases

Fase 2 sugerida:

- exportar resultados CSV;
- contador de aciertos;
- preguntas más difíciles.

Fase 3 sugerida:

- segunda votación después de discusión;
- notas del docente;
- temporizador opcional.
