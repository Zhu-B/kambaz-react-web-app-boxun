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
import './QuizTaking.css';

export default function Quizzes() {
    const { cid } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [toDelete, setToDelete] = useState<string | null>(null);
    const { list: quizzes } = useSelector((state: any) => state.quizzesReducer);    const { currentUser } = useSelector((state: any) => state.accountReducer);
    
    const isFaculty = currentUser?.role === "FACULTY";
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
    const courseQuizzes = quizzes;    return (
        <div id="wd-quizzes">
            <div className="mb-3">
                <FaSearch className="position-absolute text-secondary"/>
                <input
                    placeholder="Search for Quiz"
                    id="wd-search-quiz"
                    className="ps-5"
                    style={{ width: 250 }}
                />
                
                {isFaculty && (
                    <button 
                        id="wd-add-quiz"
                        className="btn btn-danger float-end"
                        onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/Create`)}
                    >
                        + Quiz
                    </button>
                )}
            </div>

            <ListGroup className="rounded-0">
                <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
                    <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
                        <MdDragIndicator className="me-2 fs-3" />
                        <span className="fw-bold flex-grow-1">
                            QUIZZES
                        </span>
                        <QuizControlButtons published={false} />
                    </div>

                    <ListGroup className="wd-quizzes rounded-0">
                        {courseQuizzes.map((quiz: any) => (<ListGroup.Item key={quiz._id} className="p-3 ps-1 d-flex align-items-center wd-quiz">
                                <MdDragIndicator className="me-2 fs-3" />
                                <span className="flex-grow-1">
                                    <Link
                                        to={
                                            isFaculty 
                                                ? `/Kambaz/Courses/${cid}/Quizzes/${quiz._id}` 
                                                : `/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/take`
                                        }
                                        className="quiz-title-link"
                                        style={{ 
                                            textDecoration: 'none', 
                                            color: quiz.published || isFaculty ? 'inherit' : '#6c757d' 
                                        }}
                                    >
                                        <div className="fw-bold">{quiz.title}</div>
                                    </Link>                                    <div className="text-muted quiz-info-text mt-1">
                                        <div>
                                            {quiz.description ? quiz.description.slice(0, 50) + (quiz.description.length > 50 ? '...' : '') : 'No description'} | {quiz.totalPoints || 0} pts
                                        </div>
                                        <div className="mt-1">
                                            <span className={`badge ${quiz.published ? 'bg-success' : 'bg-warning'}`}>
                                                {quiz.published ? "Published" : "Not Published"}
                                            </span>
                                            <span className="ms-2">Due {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'No due date'}</span>
                                        </div>
                                    </div>
                                </span>
                                {isFaculty && <QuizControlButtons published={quiz.published} />}
                                {isFaculty && (
                                    <IoTrash
                                        className="fs-4 text-danger ms-2"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setToDelete(quiz._id)}
                                    />
                                )}
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
