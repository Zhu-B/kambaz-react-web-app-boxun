import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";
// import { assignments as dbAssignments } from "../../Database";

// export interface Assignment {
//   _id: string;
//   title: string;
//   description: string;
//   points: number;
//   due_date: string;
//   available_date: string;
//   submission_type: string;
//   assignment_group: string;
//   course: string;
//   editing?: boolean;
// }

// interface AssignmentsState {
//   assignments: Assignment[];
// }

// const initialState: AssignmentsState = {
//   assignments: dbAssignments as Assignment[],
// };

// const assignmentsSlice = createSlice({
//   name: "assignments",
//   initialState,
//   reducers: {
//     addAssignment: (
//       state,
//       action: PayloadAction<Omit<Assignment, "_id" | "editing">>
//     ) => {
//       const newAssignment: Assignment = {
//         _id: uuidv4(),
//         ...action.payload,
//       };
//       state.assignments = [...state.assignments, newAssignment];
//     },
//     deleteAssignment: (state, action: PayloadAction<string>) => {
//       state.assignments = state.assignments.filter(
//         (a) => a._id !== action.payload
//       );
//     },
//     updateAssignment: (state, action: PayloadAction<Assignment>) => {
//       state.assignments = state.assignments.map((a) =>
//         a._id === action.payload._id ? action.payload : a
//       );
//     },
//     editAssignment: (state, action: PayloadAction<string>) => {
//       state.assignments = state.assignments.map((a) =>
//         a._id === action.payload ? { ...a, editing: true } : a
//       );
//     },
//     cancelEditAssignment: (state, action: PayloadAction<string>) => {
//       state.assignments = state.assignments.map((a) =>
//         a._id === action.payload ? { ...a, editing: false } : a
//       );
//     },
//   },
// });

// export const {
//   addAssignment,
//   deleteAssignment,
//   updateAssignment,
//   editAssignment,
//   cancelEditAssignment,
// } = assignmentsSlice.actions;

// export default assignmentsSlice.reducer;
const initialState = {
  assignments: [],
};
const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    setAssignments: (state, { payload: assignments }) => {
      state.assignments = assignments;
    },    addAssignment: (state, { payload: assignment }) => {
      state.assignments = [...state.assignments, assignment] as any;
    },
    deleteAssignment: (state, { payload: assignmentId }) => {
      state.assignments = state.assignments.filter(
        (a: any) => a._id !== assignmentId
      );
    },
    updateAssignment: (state, { payload: assignment }) => {
      state.assignments = state.assignments.map((a: any) =>
        a._id === assignment._id ? assignment : a
      ) as any;
    },
    editAssignment: (state, { payload: assignmentId }) => {
      state.assignments = state.assignments.map((a: any) =>
        a._id === assignmentId ? { ...a, editing: true } : a
      ) as any;
    },
  },
});
export const { addAssignment, deleteAssignment, updateAssignment, editAssignment, setAssignments } =
  assignmentsSlice.actions;
export default assignmentsSlice.reducer;