import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LiveUpdate } from "./LiveUpdate";
import { getPostScore, PostValues, ScoreResponse } from "./getScore";

function PostForm() {
  const [fetching, setFetching] = useState<boolean>(false)
  const [value, setValue] = useState<ScoreResponse>({ score: 0})
  const [error, setError] = useState<boolean>(false)

  const methods = useForm({
    defaultValues: {
      followed: false,
      replied_by_followed: false,
      like_count: 0,
      reply_count: 0,
      click_count: 0,
      like_history: 0,
      reply_history: 0,
      click_history: 0,
      age: 0,
      embedding_similarity: 0
    }
  })
  const { register, handleSubmit, formState: { isValid, errors } } = methods

  const onSubmit = async (data: PostValues) => {
    setFetching(true)
    try {
      setValue(await getPostScore(data))
    }
    catch (e) {
      if (e instanceof Error) {
        console.error(e)
        alert(e.message)
        setError(true)
      }
    }
    setFetching(false)
  }

  const submit = handleSubmit(onSubmit)
  if (!isValid)
    console.log(errors)

  return (
    <main style={{ margin: "auto 50px" }}>

      <h1>Post ranker</h1>

      <FormProvider {...methods}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column",gap:10,alignItems:"start" }}>
          {false && <LiveUpdate submit={submit} />}

          <label>
            Followed
            <input type="checkbox" {...register("followed")} />
          </label>

          <label>
            Replied by followed user
            <input type="checkbox" {...register("replied_by_followed")} />
          </label>

          <label>
            Likes
            <input type="number" step={100} min={0} {...register("like_count", { required: true })} />
          </label>

          <label>
            Comments
            <input type="number" step={100} min={0} {...register("reply_count", { required: true })} />
          </label>

          <label>
            Clicks
            <input type="number" step={100} min={0} {...register("click_count", { required: true })} />
          </label>

          <label>
            Recent like history with poster
            <input type="number" max={1000} min={0} step={5} {...register("like_history", { required: true })} />
          </label>

          <label>
            Recent reply history with poster
            <input type="number" max={1000} min={0} step={5} {...register("reply_history", { required: true })} />
          </label>

          <label>
            Recent click history with poster
            <input type="number" max={1000} min={0} step={5} {...register("click_history", { required: true })} />
          </label>

          <label>
            Embedding similarity
            <input type="number" max={1} min={0} step={0.1} {...register("embedding_similarity", { required: true })} />
          </label>

          <label>
            Age in hours
            <input type="number" max={48} min={0} step={10} {...register("age", { required: true })} />
          </label>

          <button type="submit">Submit</button>

        </form>

        {
          fetching ? (
            <p>...</p>
          ) : !isValid ? (
            <p>Validation error</p>
          ) : error ? (
            <p>Error</p>
          ) : (
            <p>Score: <strong>{value.score}</strong></p>
          )
        }

      </FormProvider>
    </main>
  )
}

export default PostForm