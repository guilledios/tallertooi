import type { Question } from "../types";

const optionPattern = /^([A-Z])[\).\s]\s+(.+)$/;
const answerPattern = /^ANSWER:\s*([A-Z])\s*$/i;

export function parseAiken(input: string): Question[] {
  const blocks = input
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const questions = blocks.map(parseBlock);

  if (questions.length === 0) {
    throw new Error("No se encontraron preguntas en formato Aiken.");
  }

  return questions;
}

function parseBlock(block: string, index: number): Question {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const answerLine = lines.find((line) => answerPattern.test(line));
  if (!answerLine) {
    throw new Error(`La pregunta ${index + 1} no tiene una línea ANSWER:.`);
  }

  const answer = answerLine.match(answerPattern)?.[1].toUpperCase();
  const answerIndex = lines.indexOf(answerLine);
  const contentLines = lines.slice(0, answerIndex);
  const firstOptionIndex = contentLines.findIndex((line) => optionPattern.test(line));

  if (firstOptionIndex <= 0) {
    throw new Error(`La pregunta ${index + 1} debe tener texto y al menos dos alternativas.`);
  }

  const text = contentLines.slice(0, firstOptionIndex).join(" ");
  const optionLines = contentLines.slice(firstOptionIndex);
  const options = optionLines.map((line) => {
    const match = line.match(optionPattern);
    if (!match) {
      throw new Error(`Alternativa inválida en la pregunta ${index + 1}: "${line}"`);
    }

    return {
      key: match[1].toUpperCase(),
      text: match[2].trim()
    };
  });

  if (options.length < 2) {
    throw new Error(`La pregunta ${index + 1} debe tener al menos dos alternativas.`);
  }

  const optionKeys = new Set(options.map((option) => option.key));
  if (!answer || !optionKeys.has(answer)) {
    throw new Error(`La respuesta correcta de la pregunta ${index + 1} no coincide con sus alternativas.`);
  }

  return {
    id: crypto.randomUUID(),
    text,
    options,
    answer
  };
}
