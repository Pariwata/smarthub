"use client";

import { useState } from "react";
import { ProjectFormModal } from "./ProjectFormModal";
import { btnPrimary } from "./ui";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={btnPrimary} onClick={() => setOpen(true)}>
        <span className="text-base leading-none">+</span> New project
      </button>
      {open && <ProjectFormModal mode="create" onClose={() => setOpen(false)} />}
    </>
  );
}
