import { DataTable } from "../ui/data-table";
import { postsalesEmpTableCol } from "./postsalesEmpTableCol";

function PostsalesEmployeeTable({ data, desc }: { data: any; desc: string }) {
  return (
    <DataTable
      columns={postsalesEmpTableCol}
      data={data}
      caption={desc}
      noFilters={true}
    />
  );
}

export default PostsalesEmployeeTable;
