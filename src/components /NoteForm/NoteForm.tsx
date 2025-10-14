import css from "./NoteForm.module.css";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import { useId } from "react";
import * as Yup from "yup";
import type { NoteTag } from "../../types/note";

const NoteFormScema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 2 characters")
    .max(50, "Title is too long")
    .required("Title is required"),
  content: Yup.string().max(500, "Content is too long"),
  tag: Yup.string()
    .required("Tag is required")
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"]),
});

interface FormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

const initialValues: FormValues = {
  title: "",
  content: "",
  tag: "Todo",
};

interface NoteFormProps {
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
}

export default function NoteForm({ onCancel, onSubmit }: NoteFormProps) {
  const inputId = useId();

  const handleSubmit = (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    onSubmit(values);
    actions.resetForm();
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={NoteFormScema}
    >
      <Form className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor={`${inputId}-title`}>Title</label>
          <Field
            id={`${inputId}-title`}
            type="text"
            name="title"
            className={css.input}
          />
          <ErrorMessage name="title" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor={`${inputId}-content`}>Content</label>
          <Field
            as="textarea"
            id={`${inputId}-content`}
            name="content"
            rows={8}
            className={css.textarea}
          />
          <ErrorMessage name="content" component="span" className={css.error} />
        </div>

        <div className={css.formGroup}>
          <label htmlFor={`${inputId}tag`}>Tag</label>
          <Field
            as="select"
            id={`${inputId}tag`}
            name="tag"
            className={css.select}
          >
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </Field>
          <ErrorMessage name="tag" component="span" className={css.error} />
        </div>

        <div className={css.actions}>
          <button onClick={onCancel} type="button" className={css.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={css.submitButton} disabled={false}>
            Create note
          </button>
        </div>
      </Form>
    </Formik>
  );
}
