import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Button, LockIcon, Modal } from "../ui";

export function UpgradeButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-1.5 rounded-full bg-income px-4 py-1.5 text-sm font-semibold text-white sm:flex"
      >
        <LockIcon className="h-4 w-4" />
        {t("upgrade.button")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("upgrade.title")}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-income-light text-income">
          <LockIcon className="h-7 w-7" />
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">{t("upgrade.message")}</p>
        <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
          {t("common.cancel")}
        </Button>
      </Modal>
    </>
  );
}
