// export class ApiResult<T> {
//     content: T[];
//     pageable: Pageable;
//     last: boolean;
//     totalElements: number;
//     totalPages: number;
//     size!: number;
//     number!: number;
//     first!: boolean;
//     numberOfElements: number;
//     sort!: Sort;

//     constructor(content: T[], totalElements: number, totalPages: number, pageSize: number, pageNumber: number, paged: boolean) {
//         this.content = content;
//         this.pageable = new Pageable(pageSize, pageNumber, paged);
//         this.last = false;
//         this.totalElements = totalElements;
//         this.totalPages = totalPages;
//         this.numberOfElements = content.length;
//     }
// }

// export class Pageable {
//     sort: Sort;
//     offset: number;
//     pageSize: number;
//     pageNumber: number;
//     unpaged: boolean;
//     paged: boolean;

//     constructor(pageSize: number, pageNumber: number, paged: boolean) {
//         this.sort = new Sort(false);
//         this.offset = 0;
//         this.pageSize = pageSize;
//         this.pageNumber = pageNumber;
//         this.paged = paged;
//         this.unpaged = !paged;
//     }
// }

// export class Sort {
//     sorted: boolean;
//     unsorted: boolean;

//     constructor(sorted: boolean) {
//         this.sorted = sorted;
//         this.unsorted = !sorted;
//     }
// }
