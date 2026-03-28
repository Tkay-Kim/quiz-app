import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import QuestionsPage from './pages/QuestionsPage'
import QuestionFormPage from './pages/QuestionFormPage'
import QuizSetupPage from './pages/QuizSetupPage'
import QuizPlayPage from './pages/QuizPlayPage'
import QuizResultPage from './pages/QuizResultPage'
import TagsPage from './pages/TagsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questions/new" element={<QuestionFormPage />} />
          <Route path="questions/:id/edit" element={<QuestionFormPage />} />
          <Route path="quiz/setup" element={<QuizSetupPage />} />
          <Route path="quiz/:sessionId/result" element={<QuizResultPage />} />
          <Route path="tags" element={<TagsPage />} />
        </Route>
        <Route path="/quiz/:sessionId" element={<QuizPlayPage />} />
      </Routes>
    </BrowserRouter>
  )
}
