"use client";
import Modal from "@/components/Modal";
import { useState } from "react";
import Main from "@/components/Main";
export default function Home() {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <div>
     <Modal open={open} setOpen={setOpen}></Modal>
     <Main></Main>
    </div>
  );
}
