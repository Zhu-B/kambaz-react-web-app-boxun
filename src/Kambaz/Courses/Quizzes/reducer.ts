import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  published: boolean;
  availableDate?: string;
  dueDate?: string;
  timeLimit?: number;
  totalPoints?: number;
  questionCount?: number;
  courseId?: string;
  multipleAttempts?: boolean;
  attemptsAllowed?: number;
  shuffleAnswers?: boolean;
  lockQuestions?: boolean;
  accessCode?: string;
  oneQuestionAtTime?: boolean;
  webcamRequired?: boolean;
}

interface QuizState {
  list: Quiz[];
  currentQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  list: [],
  currentQuiz: null,
  loading: false,
  error: null,
};

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    fetchQuizzesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchQuizzesSuccess(state, { payload }: { payload: Quiz[] }) {
      state.list = payload;
      state.loading = false;
    },
    fetchQuizzesFailure(state, { payload }: { payload: string }) {
      state.loading = false;
      state.error = payload;
    }, 
    addQuiz(state, { payload }: { payload: Partial<Quiz> }) {
      const newQuiz: Quiz = {
        _id: uuidv4(),
        title: payload.title || 'New Quiz',
        description: payload.description || '',
        published: payload.published || false,
        availableDate: payload.availableDate,
        dueDate: payload.dueDate,
        timeLimit: payload.timeLimit,        totalPoints: payload.totalPoints,
        questionCount: 0,
        courseId: payload.courseId,
      };
      state.list.push(newQuiz);
    },

    // Update
    updateQuiz(state, { payload }: { payload: Quiz }) {
      state.list = state.list.map(q =>
        q._id === payload._id ? payload : q
      );
      if (state.currentQuiz?._id === payload._id) {
        state.currentQuiz = payload;
      }
    },

    // Delete
    deleteQuiz(state, { payload }: { payload: string }) {
      state.list = state.list.filter(q => q._id !== payload);
      if (state.currentQuiz?._id === payload) {
        state.currentQuiz = null;
      }
    },

    //Select
    setCurrentQuiz(state, { payload }: { payload: Quiz | null }) {
      state.currentQuiz = payload;
      state.error = null;
    },
  },
});

export const {
  fetchQuizzesRequest,
  fetchQuizzesSuccess,
  fetchQuizzesFailure,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  setCurrentQuiz,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;
