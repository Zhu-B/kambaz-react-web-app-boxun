import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export interface Enrollment {
  _id: string;
  user: string;
  course: string;
}

interface EnrollmentsState {
  enrollments: Enrollment[];
}

const initialState: EnrollmentsState = {
  enrollments: [],
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    enrollCourse: (
      state,
      { payload: { user, course } }
    ) => {
      if (
        !state.enrollments.find(
          (e) => e.user === user && e.course === course
        )
      ) {
        state.enrollments.push({ _id: uuidv4(), user, course });
      }
    },
    unenrollCourse: (
      state,
      { payload: { user, course } }
    ) => {
      state.enrollments = state.enrollments.filter(
        (e) => !(e.user === user && e.course === course)
      );
    },
  },
});

export const { enrollCourse, unenrollCourse } =
  enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;