import { useParams } from "react-router";

export default function Quizzes() {
    const { cid } = useParams();
    
    return (
        <div className="wd-quizzes">
        <h2>Quizzes</h2>
        <p>Quizzes Placeholder wwwwww</p>
        </div>
    );
}
