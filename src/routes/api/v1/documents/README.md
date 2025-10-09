# End points to deal with documents. Note: there are also /documents/collection
# paths that deal with CRUD ops in the DocumentCollectionLink table and
# documents/project that deals with fetching documents from a project container
# TODO: get the logged in user from a Depends middleware to ensure permissions

All responses contain: {
  timestamp: utc unix millis
  status: HTTP Status
  msg: String
  count: Present for array type data responses
  data: types data of the response
}
Reponse types below are given for the data parameter


route = {config.apiEndpoint}/documents


@routes.get('')
get_all_documents -> array of documents or empty array
Note: with limit and skip params


@routes.get('/{document_uid}')
get_single_document -> single Document or throws 404


@routes.post('')
async def add_new_document -> new Document or throws HTTP_422_UNPROCESSABLE_ENTITY,


@routes.patch('/{document_uid}')
update_document -> updated Document or raises:
  - HTTP_404_NOT_FOUND id uid wasn't found
  - HTTP_422_UNPROCESSABLE_ENTITY if there were not enough parameters to update


@routes.delete('/{document_uid}')
delete_document -> HTTP_204_NO_CONTENT or throws:
    - 500-Internal server error if the DB failed to update
    - 404-Not found if the specified resource wasn't found [in the db]


@routes.post('/job-queue-upload')
job_queue_file_upload():
    Replacement endpoint for deprecated `api/v1/documents/upload` 
    
@routes.post('/inline-upload')
inline_file_upload
    Replacement endpoint for deprecated `api/v1/docuemnts/add-context`

Note. `api/v1/upload` takes an array of files and/or folders 
and uploads them from the source disk location


@routes.get('/{document_uid}/summary')
get_document_summary -> source_doc, with text splits if ?with_splits=1 in url


@routes.get('/collection/{collection}')
get_all_documents_in_collection
Params:
    collection: uuid.UUID | str,  # The collection name or UUID
    owner: uuid.UUID | None = None,  # The collection owner
    limit: int | None = None,
    skip: int | None = None,

returns: array of Documents


@routes.post('/collection')
add_document_to_collection -> UUID of the newly created row in the link table


@routes.delete('/collection/{collection_uid}/{document_uid}')
delete_document_from_collection -> HTTP_204_NO_CONTENT
TODO: add list of documents to request and process all of them


@routes.patch('/collection/{collection_uid}')
move_document_to_collection -> UUID of the new link, see notes below:

 With /documents/collection/{collection_uid} as the source collection,
    removes the document from source and adds a new entry using the parameters
    specified in `req`:
      collection_uid
      document_uid

    Raises 304-not modified if the document is already in the specified
    collection [in the request body].
    Raises 401-not authroized if the user doesn't have permissions on either the
    collection or document.
    Raises 404-not found if the document in `req` isn't in the source collection.

