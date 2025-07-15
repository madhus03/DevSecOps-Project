import {
    LoaderFunctionArgs,
    useLoaderData,
} from "react-router-dom";
import GridPage from "src/components/GridPage";
import { COMMON_TITLES } from "src/constant";
import store from "src/store";
import {
    genreSliceEndpoints,
} from "src/store/slices/genre";
import { MEDIA_TYPE } from "src/types/Common";
import { CustomGenre, Genre } from "src/types/Genre";

export async function loader({ params }: LoaderFunctionArgs) {
  let genre: CustomGenre | Genre | undefined = COMMON_TITLES.find(
    (t) => t.apiString === (params.genreId as string)
  );
  if (!genre) {
    const genres = await store
      .dispatch(genreSliceEndpoints.getGenres.initiate(MEDIA_TYPE.Movie))
      .unwrap();
    genre = genres?.find((t) => t.id.toString() === (params.genreId as string));
  }

  return genre;
}

export function Component() {
  const genre: CustomGenre | Genre | undefined = useLoaderData() as
    | CustomGenre
    | Genre
    | undefined;
  // const { genreId } = useParams();
  // const { data: genres } = useGetGenresQuery(MEDIA_TYPE.Movie);
  // let genre: Genre | CustomGenre | undefined;
  // if (isNaN(parseInt(genreId!))) {
  //   genre = COMMON_TITLES.find((t) => t.apiString === genreId);
  // } else {
  //   genre = genres?.find((t) => t.id.toString() === genreId);
  // }
  if (genre) {
    return <GridPage mediaType={MEDIA_TYPE.Movie} genre={genre} />;
  }
  return null;
}

Component.displayName = "GenreExplore";