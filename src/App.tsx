import './App.css'
import Resizer from 'react-image-file-resizer'
import 'react-image-crop/dist/ReactCrop.css'

function App(): JSX.Element {
  const uploadFile = async (): Promise<void> => {
    const file = document.getElementById('file') as HTMLInputElement
    const selectedFile = file?.files?.[0]

    const url = await getPresignedUrl()

    fetch(url, {
      method: 'PUT',
      body: selectedFile
    })
      .then(async (response) => {
        if (!response.ok) {
          return await response.text().then((errorText) => {
            console.log(errorText)
            throw new Error(`Request failed: ${response.status}`)
          })
        }
        // その他の処理
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const getPresignedUrl = async (): Promise<string> => {
    const file = document.getElementById('file') as HTMLInputElement
    const selectedFile = file?.files?.[0]
    const url = await fetch(
      // `${process.env.API_URL}/presigned-url?key=${selectedFile?.name ?? ''}`
      `${process.env.API_URL}/getPresignedUrl?key=${selectedFile?.name ?? ''}`
    )
    // return await url.text()
    const resultUrl = await url.json()
    return resultUrl.presigned_url
  }

  const resizeNumbers = [
    {
      width: 300,
      height: 300
    },
    {
      width: 600,
      height: 600
    },
    {
      width: 900,
      height: 900
    }
  ]
  const resizing = async (): Promise<void> => {
    const file = document.getElementById('file') as HTMLInputElement
    const selectedFile = file?.files?.[0]
    let fileType = ''
    switch (selectedFile?.type) {
      case 'image/png':
        fileType = 'PNG'
        break
      case 'image/jpeg':
      case 'image/jpg':
        fileType = 'JPEG'
        break
      case 'image/webp':
        fileType = 'WEBP'
        break
      default:
        break
    }

    if (selectedFile == null || fileType === '') return

    const imgOriginal = new Image()
    const urlOriginal = URL.createObjectURL(selectedFile)
    imgOriginal.onload = function () {
      console.log('width: ', imgOriginal.width)
      console.log('height: ', imgOriginal.height)
    }
    imgOriginal.src = urlOriginal

    // リサイズ処理
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    resizeNumbers.forEach(async (resizeNumber, index) => {
      const test: string | File | Blob | ProgressEvent<FileReader> =
        await new Promise((resolve) => {
          Resizer.imageFileResizer(
            selectedFile,
            resizeNumber.width,
            resizeNumber.height,
            fileType,
            100,
            0,
            (uri) => {
              resolve(uri)
            },
            'file'
          )
        })

      // リサイズした画像を表示（実際はしないと思うが、確認のため）
      if (test instanceof File) {
        const img = document.getElementById(
          `img${index + 1}`
        ) as HTMLImageElement
        const url = URL.createObjectURL(test)
        img.src = url

        const imgtest = new Image()
        imgtest.onload = function () {
          console.log('resizeNumber: ', resizeNumber)
          console.log('width: ', imgtest.width)
          console.log('height: ', imgtest.height)
        }
        imgtest.src = url
      }
    })
  }

  return (
    <>
      <h1>Presigned URL テスト</h1>
      <div className="card">
        <button
          onClick={() => {
            resizing()
          }}
        >
          リサイズ
        </button>
        <button
          onClick={() => {
            uploadFile()
          }}
        >
          アップロード実行
        </button>
        <input type="file" id="file" name="file" />
      </div>
      <div>
        <h2>画像</h2>
        <img id="img" src="" alt="" />
        <img id="img1" src="" alt="" />
        <img id="img2" src="" alt="" />
        <img id="img3" src="" alt="" />
      </div>
    </>
  )
}

export default App
