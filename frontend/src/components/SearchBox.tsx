import { Input } from "antd";
import React, { useEffect } from "react";
import Fuse from "fuse.js";

type Props<T extends unknown> = {
  list: T[];
  keys: string[];
  resultsSetter: (arr: T[]) => void;
  placeholder?: string;
};

/**
 * Fuzzy search component.
 */
const SearchBox = <T extends unknown>({
  list,
  keys,
  resultsSetter,
  placeholder = "Search",
}: Props<T>) => {
  const options: Fuse.IFuseOptions<T> = {
    keys,
    threshold: 0.3,
    findAllMatches: false,
    isCaseSensitive: false,
  };

  const fuse = new Fuse(list, options);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = e.target.value;
    const result = fuse.search(pattern);
    if (pattern) {
      resultsSetter(result.map((el) => el.item));
    } else {
      resultsSetter(list);
    }
  };

  useEffect(() => {
    resultsSetter(list);
  }, [list, resultsSetter]);

  return (
    <Input
      onChange={onSearch}
      placeholder={placeholder}
      style={{ width: "250px" }}
      allowClear
    />
  );
};

export default SearchBox;
