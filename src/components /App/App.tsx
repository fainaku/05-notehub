import css from "./App.module.css";
import NoteList from "../NoteList/NoteList";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import { Toaster } from "react-hot-toast";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";
import {
  createNote,
  deleteNote,
  fetchNotes,
  type CreateNoteRequest,
} from "../../services/noteService";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [perPage, setPerPage] = useState<number>(12);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {},
  });

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["notes", page, search, perPage],
    queryFn: () => fetchNotes(search, page, perPage),
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateNoteRequest) => createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeModal();
    },
    onError: () => {},
  });

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Toaster />
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox />
          {isSuccess && totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              page={page}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
          <button onClick={openModal} className={css.button}>
            Create note +
          </button>
          {isModalOpen && (
            <Modal onClose={closeModal}>
              <NoteForm
                onCancel={closeModal}
                onSubmit={(values) => createMutation.mutate(values)}
              />
            </Modal>
          )}
        </header>

        {isLoading && <Loader />}
        {isError && <ErrorMessage />}

        {notes.length > 0 && (
          <NoteList
            onDelete={(id) => deleteMutation.mutate(id)}
            notes={notes}
          />
        )}
      </div>
    </>
  );
}
