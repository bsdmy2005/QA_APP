"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient( 
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

interface FileData {
  name: string
  type: string
  arrayBuffer: Uint8Array
}

export async function uploadImages(filesData: FileData[], folder: string = "questions"): Promise<string[]> {
  const urls: string[] = []

  for (const fileData of filesData) {
    const buffer = Buffer.from(fileData.arrayBuffer)

    const { data, error } = await supabase.storage
      .from("qna")
      .upload(`${folder}/${Date.now()}-${fileData.name}`, buffer, {
        contentType: fileData.type,
        upsert: true
      })

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from("qna")
      .getPublicUrl(data.path)

    urls.push(publicUrl)
  }

  return urls
}

export async function deleteImages(urls: string[]): Promise<void> {
  for (const url of urls) {
    const path = url.split("/").pop()
    if (path) {
      await supabase.storage
        .from("qna")
        .remove([path])
    }
  }
} 