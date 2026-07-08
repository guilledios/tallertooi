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

  const shuffledOptions = shuffleOptions(options);
  const relabeledOptions = shuffledOptions.map((option, optionIndex) => ({
    key: optionKeyForIndex(optionIndex),
    text: option.text,
    originalKey: option.key
  }));
  const shuffledAnswer = relabeledOptions.find((option) => option.originalKey === answer)?.key;

  if (!shuffledAnswer) {
    throw new Error(`No se pudo mezclar la pregunta ${index + 1}.`);
  }

  return {
    id: crypto.randomUUID(),
    text,
    options: relabeledOptions.map(({ key, text: optionText }) => ({ key, text: optionText })),
    answer: shuffledAnswer
  };
}

function shuffleOptions<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (items.length > 1 && shuffled.every((item, index) => item === items[index])) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function randomInteger(maxExclusive: number) {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

function optionKeyForIndex(index: number) {
  return String.fromCharCode("A".charCodeAt(0) + index);
}
