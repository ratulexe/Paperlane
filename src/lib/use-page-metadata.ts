import { useEffect } from "react";

type PageMetadata = {
  title: string;
  description: string;
};

export function usePageMetadata({ title, description }: PageMetadata) {
  useEffect(() => {
    document.title = title;

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.content = description;
  }, [description, title]);
}
