import axios from "axios";
import type { Quiz } from "./reducer";

export interface Question {
  _id: string;
  quizId: string;
  type: string;
  title: string;
  body?: string;
  points?: number;
  choices?: { _id?: string; text: string; isCorrect: boolean }[];
  correctAnswer?: boolean;
  trueOrFalse?: boolean;
  acceptableAnswers?: string[];
  position?: number;
}

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;
const COURSES_API = `${REMOTE_SERVER}/api/courses`;
const axiosWithCredentials = axios.create({ withCredentials: true });

//Quiz
//Fetch quizzes
export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const { data } = await axiosWithCredentials.get(QUIZZES_API);
  return data;
};

//Fetch quizzes for course
export const fetchQuizzesForCourse = async (courseId: string): Promise<Quiz[]> => {
  const { data } = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/quizzes`);
  return data;
};

//Fetch a quiz
export const fetchQuiz = async (quizId: string): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.get(`${QUIZZES_API}/${quizId}`);
  return data;
};

//Create
export const createQuiz = async (
  quiz: Partial<Quiz>
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.post(QUIZZES_API, quiz);
  return data;
};

//Create for course
export const createQuizForCourse = async (
  courseId: string,
  quiz: Partial<Quiz>
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.post(
    `${COURSES_API}/${courseId}/quizzes`,
    quiz
  );
  return data;
};

//Update
export const updateQuiz = async (
  quiz: Quiz
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.put(
    `${QUIZZES_API}/${quiz._id}`,
    quiz
  );
  return data;
};

//Delete
export const deleteQuiz = async (
  quizId: string
): Promise<void> => {
  await axiosWithCredentials.delete(`${QUIZZES_API}/${quizId}`);
};

//Publish
export const publishQuiz = async (
  quizId: string
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.post(
    `${QUIZZES_API}/${quizId}/publish`
  );
  return data;
};

//Unpublish
export const unpublishQuiz = async (
  quizId: string
): Promise<Quiz> => {
  const { data } = await axiosWithCredentials.post(
    `${QUIZZES_API}/${quizId}/unpublish`
  );
  return data;
};

//Question
//Fetch questions
export const fetchQuestions = async (
  quizId: string
): Promise<Question[]> => {
  const { data } = await axiosWithCredentials.get(
    `${QUIZZES_API}/${quizId}/questions`
  );
  return data;
};

//Get question
export const getQuestion = async (
  questionId: string
): Promise<Question> => {
  const { data } = await axiosWithCredentials.get(
    `${REMOTE_SERVER}/api/questions/${questionId}`
  );
  return data;
};

//Add question
export const addQuestion = async (
  quizId: string,
  question: Partial<Question>
): Promise<Question> => {
  const { data } = await axiosWithCredentials.post(
    `${QUIZZES_API}/${quizId}/questions`,
    question
  );
  return data;
};

//Update
export const updateQuestion = async (
  question: Question
): Promise<Question> => {
  const { data } = await axiosWithCredentials.put(
    `${REMOTE_SERVER}/api/questions/${question._id}`,
    question
  );
  return data;
};

//Delete
export const deleteQuestion = async (
  questionId: string
): Promise<void> => {
  await axiosWithCredentials.delete(
    `${REMOTE_SERVER}/api/questions/${questionId}`
  );
};

export const reorderQuestions = async (
  quizId: string,
  orderedIds: string[]
): Promise<void> => {
  await axiosWithCredentials.post(
    `${QUIZZES_API}/${quizId}/questions/reorder`,
    { orderedIds }
  );
};
