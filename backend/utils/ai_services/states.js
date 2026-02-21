import * as z from 'zod'

const SectionSchema = z.lazy(() =>
  z.object({
    sectionNumber: z.string().describe("Section number like 1.1, 2.3.4"),
    title: z.string().describe("Title of the section"),
    startingPage: z.number().describe("Page where the section starts"),
    subsections: z.array(SectionSchema).optional(),
  })
);

const UnitSchema = z.object({
  unitNumber: z.string().describe("Unit number like 1, 2, 3"),
  title: z.string().describe("Title of the unit"),
  startingPage: z.number().describe("Page where the unit starts"),
  sections: z.array(SectionSchema).optional().describe("Subsection if has"),
});

const TOCSchema = z.object({
  units: z.array(UnitSchema),
});


const SubsectionState = z.lazy(() =>
    z.object({
        sectionNumber: z.string(),
        headingLevel: z.number(),
        title: z.string(),
        startingPage: z.number(),
        endingPage: z.number(),
        startingPageIndex: z.number(),
        endingPageIndex: z.number(),
        splittedBook: z.any(),
        content: z.string(),
        pageDiff: z.number(),
        toc: SectionSchema,
        subsections: z.array(SubsectionState).optional()
    })
)

const SectionState = z.object({
    sectionNumber: z.string(),
    headingLevel: z.number(),
    title: z.string(),
    startingPage: z.number(),
    endingPage: z.number(),
    startingPageIndex: z.number(),
    endingPageIndex: z.number(),
    splittedBook: z.any(),
    content: z.string(),
    pageDiff: z.number(),
    toc: SectionSchema,
    subsections: z.array(SubsectionState).optional()
})

const UnitState = z.object({
    unitNumber: z.string(),
    title: z.string(),
    startingPage: z.number(),
    endingPage: z.number(),
    startingPageIndex: z.number(),
    endingPageIndex: z.number(),
    splittedBook: z.any(),
    pageDiff: z.number(),
    toc: UnitSchema,
    sections: z.array(SectionState).optional()
})

const BookState = z.object({
    gradeLevel: z.string(),
    subject: z.string(),
    totalPage: z.number(),
    version: z.string(),
    filePath: z.string(),
    splittedBook: z.any(),
    tocStartingPage: z.number(),
    tocEndingPage: z.number(),

    pageDiff: z.number(),
    rawToc: z.string(),
    toc: TOCSchema,
    units: z.array(UnitState).optional()
})


export {
    BookState,
    UnitState,
    SectionState,
    SubsectionState,
    TOCSchema,
    UnitSchema,
    SectionSchema
}