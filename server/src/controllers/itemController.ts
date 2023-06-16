import { Request, Response } from "express";
import { errorHandler } from "../utils";
import Item from "../models/item";
import { User } from "../types";
import Collection from "../models/collection";
import { uploadImage } from "../utils/uploadImage";

const getItemByCollectionId = async (req: Request, res: Response) => {
  try {
    const collectionId = req.params.id;
    const item = await Item.findOne({ collectionId });

    if (!item) {
      errorHandler(res, 404, "Item not found");
    }

    res.status(200).json([item]);
  } catch (err) {
    errorHandler(res, 500, `Internal Server Error: ${err}`);
  }
};

const createItem = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const { collectionId, title, tags, image, fields, likes } = req.body;

    const collection = await Collection.findById(collectionId).exec();

    if (!user) {
      errorHandler(res, 401, "Unauthorized!");
      return;
    }

    let imageUrl;

    if (image) {
      imageUrl = await uploadImage(image);
    }

    if (!collection) {
      errorHandler(res, 404, "Collection not found");
      return;
    }

    const newItem = await new Item({
      userId: user._id,
      collectionId,
      title,
      tags,
      likes,
      image: imageUrl,
      fields: { ...collection?.fields, ...fields },
    }).save();

    collection.items.push(newItem);
    await collection.save();

    res.status(201).json({ message: "New item has been created!", newItem });
  } catch (error) {
    errorHandler(res, 500, `Internal server error ${error}`);
  }
};

const updateItem = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    errorHandler(res, 500, `Internal server error ${error}`);
  }
};

const deleteItem = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    errorHandler(res, 500, `Internal server error ${error}`);
  }
};

export { getItemByCollectionId, createItem, updateItem, deleteItem };
