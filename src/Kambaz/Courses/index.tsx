import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation, Navigate, Route, Routes } from "react-router-dom";
import CourseNavigation from "./Navigation";
import Home from "./Home";
import Modules from "./Modules";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import PeopleTable from "./People/Table";
import { FaAlignJustify } from "react-icons/fa";
import { useState, useEffect } from "react";
import Quizzes from "./Quizzes";
import QuizEditor from "./Quizzes/Editor";
import QuizDetails from "./Quizzes/Details";
import Questions from "./Quizzes/Questions";
import QuestionEditor from "./Quizzes/QuestionEditor";
import QuizTaking from "./Quizzes/QuizTaking";
import * as courseClient from "./client";
import { setCourses } from "./reducer";

type Course = {
  _id: string;
  name: string;
  number: string;
  startDate: string;
  endDate: string;
  description: string;
  enrolled?: boolean;
  editing?: boolean;
  modules?: any[];
};

export default function Courses() {
  const { cid } = useParams<{ cid: string }>();
  const location = useLocation();
  const courses = useSelector((s: any) => s.coursesReducer.courses);
  const dispatch = useDispatch();
  const [course, setCourse] = useState<any>(null);
  
  useEffect(() => {
    const foundCourse = courses.find((c: Course) => c._id === cid);
    if (foundCourse) {
      setCourse(foundCourse);
    } else {

      const fetchCourses = async () => {
        try {
          const coursesData = await courseClient.fetchAllCourses();
          dispatch(setCourses(coursesData));

          const targetCourse = coursesData.find((c: Course) => c._id === cid);
          setCourse(targetCourse || null);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setCourse(null);
        }
      };
      fetchCourses();
    }
  }, [cid, courses, dispatch]);
//  const course = courses.find((c: Course) => c._id === cid);
  if (!course) return <div>Course not found</div>;

  return (
    <div id="wd-courses">
      <h2 className="text-danger">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        {course.name} &gt; {location.pathname.split("/")[4]}
      </h2>
      <hr />
      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="Home" />} />
            <Route path="Home" element={<Home />} />
            <Route path="Modules" element={<Modules />} />
            <Route path="Assignments" element={<Assignments />} />
            <Route path="Assignments/:aid" element={<AssignmentEditor />} />
            <Route path="People" element={<PeopleTable />} />            <Route path="Quizzes" element={<Quizzes />} />
            <Route path="Quizzes/Create" element={<QuizEditor />} />
            <Route path="Quizzes/:qid/edit" element={<QuizEditor />} />
            <Route path="Quizzes/:qid/questions" element={<Questions />} />
            <Route path="Quizzes/:qid/question-new" element={<QuestionEditor />} />
            <Route path="Quizzes/:qid/question-edit/:questionId" element={<QuestionEditor />} />
            <Route path="Quizzes/:qid/take" element={<QuizTaking />} />
            <Route path="Quizzes/:qid" element={<QuizDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}