import { insertPixstudioEntryQuery, getPixstudioStatsQuery } from "../queries/pixstudio.query";

export const submitPixstudioDataService = async (data: any) => {
    return await insertPixstudioEntryQuery(data);
};

export const getPixstudioStatsService = async () => {
    return await getPixstudioStatsQuery();
};
