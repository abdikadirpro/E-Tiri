import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Modal } from "../ui";

export function UpgradeButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden rounded-full bg-income px-4 py-1.5 text-sm font-semibold text-white sm:block"
      >
        {t("upgrade.button")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("upgrade.title")}>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t("upgrade.message")}</p>
        <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
          {t("common.cancel")}
        </Button>
      </Modal>
    </>
  );
}
