import React from "react";
import Moment from "moment";
import "moment/locale/tr";
import { MdDateRange } from "react-icons/md";

export default function ArticleDates({
  publishedAt,
  updatedAt,
}: {
  publishedAt: Date;
  updatedAt: Date;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-1 md:gap-4 text-sm">
      <div className="flex flex-row items-center text-midgray mr-0 sm:mr-4">
        <MdDateRange className="mr-2" />
        <time className="sm:mt-1 mr-2">
          {Moment(publishedAt).locale("tr").format("LL")}
        </time>
        <time className="sm:mt-1">
          {Moment(publishedAt).locale("tr").format("HH:mm")}
        </time>
      </div>
      <div className="flex flex-row items-center text-midgray text-xs md:text-sm">
        <span className="sm:mt-1 mr-2">Son Güncelleme:</span>
        <time className="sm:mt-1 mr-2">
          {Moment(updatedAt).locale("tr").format("LL")}
        </time>
        <time className="sm:mt-1">
          {Moment(updatedAt).locale("tr").format("HH:mm")}
        </time>
      </div>
    </div>
  );
}
