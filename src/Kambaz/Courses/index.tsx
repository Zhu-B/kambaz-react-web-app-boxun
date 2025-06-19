import { useSelector } from "react-redux";
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
//import type { Course } from "./reducer";

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
  const [course, setCourse] = useState<any>(null);
  useEffect(() => {
    const foundCourse = courses.find((c: Course) => c._id === cid);
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      setCourse(null);
    }
  }, [cid, courses]);
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
            <Route path="People" element={<PeopleTable />} />
            <Route path="Quizzes" element={<Quizzes />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}