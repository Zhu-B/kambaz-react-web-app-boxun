import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import * as quizzesClient from "./client";
import { ListGroup, Modal, Button } from "react-bootstrap";
import { MdDragIndicator } from "react-icons/md";
import QuizControlButtons from "./QuizControlButtons";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoTrash } from "react-icons/io5";
import { deleteQuiz, fetchQuizzesSuccess, fetchQuizzesFailure } from "./reducer";

export default function Quizzes() {
    const { cid } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [toDelete, setToDelete] = useState<string | null>(null);
    const { list: quizzes } = useSelector((state: any) => state.quizzesReducer);    
    const fetchQuizzes = async () => {
        try {
            const quizzesData = await quizzesClient.fetchQuizzesForCourse(cid as string);
            dispatch(fetchQuizzesSuccess(quizzesData));
        } catch (error) {
            dispatch(fetchQuizzesFailure("Failed to fetch quizzes"));
        }
    };    
    useEffect(() => {
        fetchQuizzes();
    }, []);
    const courseQuizzes = quizzes;

    return (
        <div id="wd-quizzes">
            <div className="mb-3">
                <FaSearch className="position-absolute text-secondary"/>
                <input
                    placeholder="Search for Quiz"
                    id="wd-search-quiz"
                    className="ps-5"
                    style={{ width: 250 }}
                />
                
                <button 
                    id="wd-add-quiz"
                    className="btn btn-danger float-end"
                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/Create`)}
                >
                    + Quiz
                </button>
            </div>

            <ListGroup className="rounded-0">
                <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
                    <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
                        <MdDragIndicator className="me-2 fs-3" />                        <span className="fw-bold flex-grow-1">
                            QUIZZES
                        </span>
                        <QuizControlButtons published={false} />
                    </div>

                    <ListGroup className="wd-quizzes rounded-0">
                        {courseQuizzes.map((quiz: any) => (
                            <ListGroup.Item key={quiz._id} className="p-3 ps-1 d-flex align-items-center wd-quiz">
                                <MdDragIndicator className="me-2 fs-3" />
                                <span className="flex-grow-1">
                                    <Link
                                        to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                                        className="wd-quiz-link"
                                    >
                                        {quiz.title}
                                    </Link>
                                    <br />
                                    <h6>
                                        {quiz.description?.slice(0, 30)}… | {quiz.totalPoints || 0} pts
                                        <br />
                                        {quiz.published ? "Published" : "Not Published"} | Due {quiz.dueDate || "No due date"}
                                    </h6>                                </span>
                                <QuizControlButtons published={quiz.published} />
                                <IoTrash
                                    className="fs-4 text-danger ms-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setToDelete(quiz._id)}
                                />
                            </ListGroup.Item>
                        ))}

                        {courseQuizzes.length === 0 && (
                            <ListGroup.Item className="text-center">
                                No quizzes found.
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </ListGroup.Item>
            </ListGroup>

            <Modal show={!!toDelete} onHide={() => setToDelete(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Quiz?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove this quiz?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setToDelete(null)}>
                        Cancel
                    </Button>                    <Button
                        variant="danger"
                        onClick={async () => {
                            try {
                                await quizzesClient.deleteQuiz(toDelete!);
                                dispatch(deleteQuiz(toDelete!));
                                setToDelete(null);
                            } catch (error) {
                                console.error("Error deleting quiz:", error);
                                setToDelete(null);
                            }
                        }}
                    >
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
