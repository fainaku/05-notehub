import css from "./App.module.css";
import NoteList from "../NoteList/NoteList";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import toast, { Toaster } from "react-hot-toast";
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
import { useDebouncedCallback } from "use-debounce";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [perPage] = useState<number>(12);

  const updateSearchQuery = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    1000
  );

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted successfully!");
    },

    onError: () => {
      toast.error("Failed to delete note. Please try again.");
    },
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
      toast.success("Note created!");
    },
    onError: () => {
      toast.error("Failed to create note.");
    },
  });

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#333",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#333",
            },
          },
        }}
      />
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox value={search} onChange={updateSearchQuery} />
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
