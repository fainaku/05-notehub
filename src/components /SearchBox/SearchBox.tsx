import { useState } from "react";
import css from "./SearchBox.module.css";
import { useDebouncedCallback } from "use-debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");

  const updateSearchQuery = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    300
  );

  return (
    <input
      className={css.input}
      type="text"
      placeholder="Search notes"
      defaultValue={searchQuery}
      onChange={updateSearchQuery}
    />
  );
}
